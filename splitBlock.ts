import { IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";

export function splitBlock(blockContent: string) {
  const lines = blockContent.split('\n');

  const batchBlock: IBatchBlock[] = [];
  const indentStack: {
    indent: number;
    block: IBatchBlock;
    parent?: IBatchBlock;
  }[] = [];
  lines.forEach(l => {
    const content = l.trimStart();
    const indent = l.length - content.length;

    const nextBlock: IBatchBlock = {
      content,
      children: [],
    };

    if (!indentStack.length) {
      batchBlock.push(nextBlock);
      indentStack.push({
        indent,
        block: nextBlock,
      });
      return;
    }

    let top = indentStack[indentStack.length - 1];
    const indentDiff = indent - top.indent;

    if (indentDiff === 0) {
      // 同级，加入父节点的 children
      if (top.parent) {
        top.parent.children!.push(nextBlock);
      } else {
        batchBlock.push(nextBlock);
      }
      top.block = nextBlock;
    } else if (indentDiff > 0) {
      // 缩进
      top.block.children!.push(nextBlock);
      indentStack.push({
        indent,
        block: nextBlock,
        parent: top.block,
      });
    } else if (indentDiff < 0) {
      // 反缩进
      // 找到同一级别的 block 的 parent block 
      while (top.indent > indent) {
        indentStack.pop();
        if (indentStack.length === 0) {
          return;
        }
        top = indentStack[indentStack.length - 1];
      }
      if (top.parent) {
        top.parent.children!.push(nextBlock);
      } else {
        batchBlock.push(nextBlock);
      }
      top.block = nextBlock;
    }
  });

  return batchBlock
}
