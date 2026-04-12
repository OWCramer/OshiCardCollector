import { gql } from "@apollo/client";

export const GET_ALL_CARDS = gql`
  query GetAllCards($filters: CardFilter, $pageSize: Int) {
    cards(filter: $filters, pageSize: $pageSize) {
      nodes {
        name
        id
        imageUrl
      }
    }
  }
`;
