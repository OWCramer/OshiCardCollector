import { gql } from "@apollo/client";

export const GET_ALL_CARDS = gql`
  query GetAllCards($page: Int) {
    cards(filter: {}, page: $page, pageSize: 100) {
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
