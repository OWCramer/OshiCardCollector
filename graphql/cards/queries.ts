import { gql } from "@apollo/client";

export const GET_CARD = gql`
  query GetCard($id: Int!) {
    card(id: $id) {
      id
      name
      cardNumber
      cardType
      color
      colors
      rarity
      imageUrl
      cardUrl
      hp
      life
      bloomLevel
      isBuzz
      isLimited
      batonPass
      extraText
      specialText
      illustrator
      releaseDate
      setNames
      tags
      arts {
        name
        damage
        cost
        effectText
        damageBonuses {
          amount
          colors
        }
      }
      oshiSkills {
        name
        skillType
        cost
        usageLimit
        effectText
      }
      qna {
        question
        answer
      }
    }
  }
`;

export const GET_ALL_CARDS = gql`
  query GetAllCards($filters: CardFilter, $pageSize: Int) {
    cards(filter: $filters, pageSize: $pageSize) {
      nodes {
        name
        id
        imageUrl
        rarity
        setNames
      }
    }
  }
`;

export const GET_RARITIES = gql`
  query GetRarities {
    rarities
  }
`;

export const GET_SETS = gql`
  query GetSets {
    sets
  }
`;
