import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.oshi.cards/graphql",
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cards: {
            // separate cache entries per unique filter
            keyArgs: ["filter"],
            merge(existing, incoming) {
              return {
                ...incoming,
                nodes: [...(existing?.nodes ?? []), ...incoming.nodes],
              };
            },
          },
        },
      },
    },
  }),
});

export default client;
