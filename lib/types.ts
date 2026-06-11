export type DocType = "policy" | "live";

export type SourceRef = {
  name: string;
  doc_type: DocType;
};
