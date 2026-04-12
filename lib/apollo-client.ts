import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://oshicardapi.luisrvervaet.workers.dev/",
  }),
  cache: new InMemoryCache(),
});

export default client;
