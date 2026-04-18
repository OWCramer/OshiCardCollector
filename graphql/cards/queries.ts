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
        id
        name
        cardNumber
        cardType
        colors
        rarity
        imageUrl
        hp
        bloomLevel
        isBuzz
        isLimited
        setNames
        tags
        releaseDate
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

export const GET_COLORS = gql`
  query GetColors {
    colors
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    tags
  }
`;
