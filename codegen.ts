import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://oshicardapi.luisrvervaet.workers.dev/graphql",
  ignoreNoDocuments: true,
  documents: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
  ],
  generates: {
    "lib/generated/graphql.ts": {
      plugins: [
        { add: { content: "// @ts-nocheck" } },
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        apolloReactHooksImportFrom: "@apollo/client/react",
      },
    },
  },
};

export default config;
