declare module "ethereum-blockies" {
  export interface BlockiesOptions {
    seed: string;
    size?: number;
    scale?: number;
    color?: string;
    bgcolor?: string;
    spotcolor?: string;
  }

  export interface Blockies {
    create(opts: BlockiesOptions): HTMLCanvasElement;
  }

  const blockies: Blockies;
  export default blockies;
}
