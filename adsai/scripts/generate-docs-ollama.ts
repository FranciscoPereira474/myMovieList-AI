import { Project } from "ts-morph";
import OpenAI from "openai";

// Configuração para ligar ao teu Ollama local
const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1', // Porta padrão do Ollama
  apiKey: 'ollama', // O Ollama exige uma string qualquer, mesmo não verificando
});

// Modelo que escolheste no Passo 1
const MODEL_NAME = "llama3.2"; 

async function generateDocForCode(codeSnippet: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert TypeScript documentation generator.
          Task: Write a TSDoc/JSDoc comment for the user's code.
          Rules:
          1. Output ONLY the comment block (starts with /** and ends with */).
          2. No markdown formatting (no \`\`\`).
          3. Use simple, clear English. No emojis.
          4. Describe parameters (@param) and return values (@returns).`
        },
        { role: "user", content: codeSnippet },
      ],
      model: MODEL_NAME,
      temperature: 0.1, // Baixa temperatura para ser mais preciso e menos "criativo"
    });

    let comment = completion.choices[0].message.content || "";
    
    // Limpeza de segurança caso o modelo seja teimoso e meta markdown
    comment = comment.replace(/```typescript|```/g, "").trim();
    
    // Garante que começa e acaba com os tokens de comentário se o modelo esquecer
    if (!comment.startsWith("/**")) comment = "/**\n" + comment;
    if (!comment.endsWith("*/")) comment = comment + "\n*/";

    return comment;
  } catch (error) {
    console.error("❌ Erro ao conectar ao Ollama. O Ollama está a correr?", error);
    return "";
  }
}

async function main() {
  // Inicializa o projeto TS
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  // Define onde procurar ficheiros (ajusta se o teu código estiver noutro lado)
const sourceFiles = project.getSourceFiles(["src/**/*.ts", "src/**/*.tsx"]);

  console.log(`🚀 Iniciando CDoc com Ollama (${MODEL_NAME})...`);
  console.log(`🔍 Encontrados ${sourceFiles.length} ficheiros.`);

  let totalGenerated = 0;

  for (const sourceFile of sourceFiles) {
    const functions = sourceFile.getFunctions();
    let fileModified = false;

    for (const func of functions) {
      // Regra: Deve ser exportada E não ter documentação ainda
      if (func.isExported() && func.getJsDocs().length === 0) {
        const functionName = func.getName();
        if (!functionName) continue; // Ignora funções anónimas

        console.log(`📝 Gerando doc para: ${functionName} em ${sourceFile.getBaseName()}`);
        
        const codeText = func.getText();
        
        // Chama a AI
        const docComment = await generateDocForCode(codeText);
        
        if (docComment) {
          // Removemos /** e */ porque o método addJsDoc adiciona-os automaticamente se passarmos string
          // MAS como o nosso script já limpa, vamos usar insertText ou simplificar:
          // A forma mais segura com ts-morph para JSDoc puro:
          func.addJsDoc(docComment.replace(/\/\*\*|\*\//g, "").trim());
          
          fileModified = true;
          totalGenerated++;
        }
      }
    }

    if (fileModified) {
      sourceFile.saveSync(); // Grava o ficheiro no disco
    }
  }

  console.log(`\n✅ Processo concluído! Documentação gerada para ${totalGenerated} funções.`);
  console.log(`⚠️  Não te esqueças de rever as alterações antes de fazer commit!`);
}

main();