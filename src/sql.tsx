export const sql = (strings: TemplateStringsArray, ...expr: any[]) =>
  strings
    .map((str, index) => str + (expr.length > index ? String(expr[index]) : ''))
    .join('');