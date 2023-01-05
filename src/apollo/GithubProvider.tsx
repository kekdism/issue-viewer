import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { ReactNode } from "react";

const githubLink = new HttpLink({
  uri: "https://api.github.com/graphql",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  },
});

const githubClient = new ApolloClient({
  link: githubLink,
  cache: new InMemoryCache({
    typePolicies: {
      Repository: {
        fields: {
          issues: relayStylePagination(),
        },
      },
    },
  }),
});

const GithubProvider = ({ children }: { children: ReactNode }) => {
  return <ApolloProvider client={githubClient}>{children}</ApolloProvider>;
};

export default GithubProvider;
