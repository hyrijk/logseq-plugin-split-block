import "@logseq/libs"
import { splitBlock } from "./splitBlock"

async function main(blockId: string) {
  const block = await logseq.Editor.getBlock(blockId)
  const newBlocks = splitBlock(block.content).map(b => {
    return {
      ...b,
      children: b.children.length ? b.children : undefined
    }
  })
  if (newBlocks.length === 1) {
    return
  }
  await logseq.Editor.insertBatchBlock(block.uuid, newBlocks, {
    sibling: true
  })
  await logseq.Editor.removeBlock(block.uuid)  
}

logseq.ready(() => {
  logseq.Editor.registerBlockContextMenuItem("Split Block", async (e) => {
    main(e.uuid)
  })

  logseq.Editor.registerSlashCommand("Split Block", async (e) => {
    main(e.uuid)
  })
}).catch(console.error)