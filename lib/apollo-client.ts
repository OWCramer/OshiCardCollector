import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://oshicardapi.luisrvervaet.workers.dev/graphql",
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
