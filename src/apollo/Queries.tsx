import { gql } from "@apollo/client";

export const GET_ISSUES = gql(`
  query GetIssues($owner: String!, $repo: String!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    id
    issues(
      first: 10
      states: OPEN
      after: $cursor
      orderBy: {field: CREATED_AT, direction: DESC}
    ) {
      edges {
        node {
          id
          title
          createdAt
          number
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`);

export const GET_ISSUE_BODY = gql(`
  query GetIssue($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      id
      issue(number: $number) {
        bodyHTML
      }
    }
  }
`);
