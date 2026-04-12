import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://api.oshi.cards/graphql",
  ignoreNoDocuments: true,
  documents: ["graphql/**/*.{ts,tsx}"],
  generates: {
    "generated/graphql.ts": {
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
