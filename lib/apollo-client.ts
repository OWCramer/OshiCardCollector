import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.oshi.cards/graphql",
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
    },
  },
  cache: new InMemoryCache(),
});

export default client;
