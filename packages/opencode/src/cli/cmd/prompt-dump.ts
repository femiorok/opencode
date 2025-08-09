import { cmd } from "./cmd"
import { Config } from "../../config/config"
import path from "path"
import fs from "fs/promises"
import { bootstrap } from "../bootstrap"

export const PromptDumpCommand = cmd({
  command: "prompt-dump",
  describe: "Dumps all runtime-resolved system and pre-written prompts to a text file.",
  builder: {
    output: {
      alias: "o",
      type: "string",
      description: "Output file path",
    },
  },
  handler: async (args) => {
    await bootstrap({ cwd: process.cwd() }, async (app) => {
      const config = await Config.get()
      const prompts: { name: string, type: "agent" | "mode", content: string }[] = []

      if (config.agent) {
        for (const [name, agent] of Object.entries(config.agent)) {
          if (agent?.prompt) {
            prompts.push({ name, type: "agent", content: agent.prompt })
          }
        }
      }

      if (config.mode) {
        for (const [name, mode] of Object.entries(config.mode)) {
          if (mode?.prompt) {
            prompts.push({ name, type: "mode", content: mode.prompt })
          }
        }
      }

      const outputPath = path.resolve(app.path.cwd, args.output || `prompt-dump.txt`)

      let outputContent = ""
      for (const prompt of prompts) {
        outputContent += `--- ${prompt.type}: ${prompt.name} ---\n`
        outputContent += `${prompt.content}\n\n`
      }

      await fs.writeFile(outputPath, outputContent.trim())
      console.log(`Successfully dumped ${prompts.length} prompts to ${outputPath}`)
    })
  },
})
