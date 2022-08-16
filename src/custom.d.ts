// needed to be able to import css files as modules containing text
declare module '*.css' {
  const content: any;
  export default content;
}
declare module '*.svg' {
  const content: any;
  export default content;
}
