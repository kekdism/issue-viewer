import "./App.css";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import { GET_ISSUES, GET_ISSUE_BODY } from "./apollo/Queries";
import { Issue, Query } from "./__generated__/graphql";

const linkCheck = new RegExp("^(http|https)://");

const App = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(-1);
  const [repository, setRepository] = useState({
    owner: "",
    repo: "",
  });

  const [
    getIssues,
    {
      fetchMore: getNextIssues,
      loading: loadingIssues,
      error,
      data: dataIssues,
      called: isIssuesCalled,
    },
  ] = useLazyQuery<Pick<Query, "repository">>(GET_ISSUES);

  const pageInfo = useMemo(() => {
    return (
      dataIssues?.repository?.issues.pageInfo || {
        endCursor: null,
        hasNextPage: false,
      }
    );
  }, [dataIssues]);

  const listIssues =
    useMemo(() => {
      if (!dataIssues) return [];
      const edgesIssues = dataIssues.repository?.issues.edges;
      return edgesIssues?.map((edge) => edge?.node!);
    }, [dataIssues]) || [];

  const [getIssue, { data: issueBody }] = useLazyQuery(GET_ISSUE_BODY);

  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      const inputUrl = new URL(
        linkCheck.test(searchValue) ? searchValue : "https://" + searchValue
      );
      if (!inputUrl.hostname.includes("github.com")) {
        throw new Error();
      }
      const [, owner, repo] = inputUrl.pathname.split("/");
      setRepository((s) => ({ ...s, owner, repo }));
      getIssues({ variables: { owner, repo } });
    } catch (e) {
      showHTMLError("Не верная ссылка");
    }
  };

  const handleInput = (evt: ChangeEvent<HTMLInputElement>) => {
    inputRef.current!.setCustomValidity("");
    setSearchValue(evt.target.value);
  };
  const showHTMLError = (message: string) => {
    inputRef.current!.setCustomValidity(message);
    inputRef.current!.reportValidity();
  };

  const handleIssueSelection = (number: number) => {
    setSelectedIssue(number);
    const { owner, repo } = repository;
    getIssue({ variables: { owner, repo, number } });
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (pageInfo.hasNextPage) {
          getNextIssues({
            variables: {
              cursor: pageInfo.endCursor,
            },
          });
        }
      }
    },
    [pageInfo]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (targetRef.current) observer.observe(targetRef.current);
  }, [handleObserver]);

  return (
    <div className="App">
      <header className={`header`}>
        <form className={`header__search`} onSubmit={handleSearchSubmit}>
          <input
            className={`header__input`}
            placeholder={`Link to repository`}
            value={searchValue}
            onChange={handleInput}
            ref={inputRef}
            required
          />
          <button className={`header__submit`} type={`submit`}>
            →
          </button>
        </form>
      </header>
      <div className="container">
        {isIssuesCalled && (
          <div className="issues">
            <ul className="list">
              {listIssues!.length > 0 && (
                <>
                  {listIssues.map((issue: any) => (
                    <li className="item" key={issue!.number}>
                      <button
                        onClick={() => handleIssueSelection(issue!.number)}
                      >
                        <p>{issue!.title}</p>
                        <p>{issue!.createdAt}</p>
                      </button>
                    </li>
                  ))}

                  <div
                    ref={targetRef}
                    style={
                      // Firefix
                      { minHeight: "1px" }
                    }
                  >
                    Давай еще
                  </div>
                </>
              )}
            </ul>

            {loadingIssues && <p>Загрузка...</p>}
            {error && <p>Ошипка</p>}
          </div>
        )}
        {issueBody && selectedIssue && (
          <div
            className="issue"
            dangerouslySetInnerHTML={{
              __html: issueBody.repository.issue.bodyHTML,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default App;
