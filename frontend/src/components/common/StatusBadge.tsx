export function StatusBadge({ value }: { value: string }) {
  const label: Record<string, string> = {
    READY: "就绪",
    DRAFT: "草稿",
    DISABLED: "停用",
    ARCHIVED: "归档",
    LOCAL_DATA: "IndexedDB 本地数据"
  };
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{label[value] ?? String(value).replace(/_/g, " ")}</span>;
}
