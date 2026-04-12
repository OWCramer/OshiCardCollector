import { gql } from "@apollo/client";

export const GET_ALL_CARDS = gql`
  query GetAllCards($page: Int, $pageSize: Int) {
    cards(filter: {}, page: $page, pageSize: $pageSize) {
      nodes {
        name
        id
        imageUrl
      }
      pageInfo {
        currentPage
        hasNextPage
        totalPages
      }
    }
  }
`;
