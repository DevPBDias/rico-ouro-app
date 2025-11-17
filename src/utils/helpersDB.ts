import { AnimalData, db } from "@/lib/db";

export async function salvarDados(dados: AnimalData[]) {
  try {
    await db.animals.bulkPut(dados);
    console.log("✅ Dados salvos no SQLite:", dados);
  } catch (error) {
    console.error("❌ Erro ao salvar no SQLite:", error);
  }
}

export async function salvarOuAtualizarDados(dados: AnimalData[]) {
  try {
    let inseridos = 0;
    let atualizados = 0;

    for (const item of dados) {
      if (!item.animal.rgn) {
        console.warn("⚠️ Registro sem RGN ignorado:", item);
        continue;
      }

      let existente: AnimalData | undefined;

      // Se tem ID, busca diretamente por ID (caso de edição pelo modal)
      if (item.id) {
        existente = await db.animals.get(item.id);
      }

      // Se não encontrou por ID, busca por RGN (caso de importação do Excel)
      if (!existente) {
        existente = await db.animals
          .where("animal.rgn")
          .equals(item.animal.rgn)
          .first();
      }

      if (existente) {
        // Atualiza o registro existente
        // Se o item tem arrays definidos (vem do modal), usa eles
        // Se não tem (vem do Excel), preserva os existentes
        const temArraysNoItem = 
          item.animal.pesosMedidos !== undefined ||
          item.animal.circunferenciaEscrotal !== undefined ||
          item.animal.ganhoDiario !== undefined;

        const merged: AnimalData = {
          ...existente,
          ...item,
          animal: {
            ...existente.animal,
            ...item.animal,
            // Preserva arrays apenas se não vierem no item (importação do Excel)
            // Se vierem no item (edição do modal), usa os do item
            pesosMedidos: temArraysNoItem && item.animal.pesosMedidos !== undefined
              ? item.animal.pesosMedidos
              : existente.animal.pesosMedidos ?? [],
            circunferenciaEscrotal: temArraysNoItem && item.animal.circunferenciaEscrotal !== undefined
              ? item.animal.circunferenciaEscrotal
              : existente.animal.circunferenciaEscrotal ?? [],
            ganhoDiario: temArraysNoItem && item.animal.ganhoDiario !== undefined
              ? item.animal.ganhoDiario
              : existente.animal.ganhoDiario ?? [],
            updatedAt: new Date().toISOString(),
          },
        };

        await db.animals.put({ ...merged, id: existente.id! });
        atualizados++;
        console.log(`🔄 Atualizado: RGN ${item.animal.rgn} (ID: ${existente.id})`);
      } else {
        // Insere novo registro (importação do Excel - não tem arrays)
        const toInsert: AnimalData = {
          ...item,
          animal: {
            ...item.animal,
            // Inicializa arrays vazios para novos registros
            pesosMedidos: item.animal.pesosMedidos ?? [],
            circunferenciaEscrotal: item.animal.circunferenciaEscrotal ?? [],
            ganhoDiario: item.animal.ganhoDiario ?? [],
            updatedAt: new Date().toISOString(),
          },
        };

        await db.animals.add(toInsert);
        inseridos++;
        console.log(`➕ Inserido: RGN ${item.animal.rgn}`);
      }
    }

    console.log(
      `✅ Processamento concluído: ${inseridos} inseridos, ${atualizados} atualizados`
    );
  } catch (error) {
    console.error("❌ Erro ao salvar/atualizar dados:", error);
    throw error;
  }
}

export async function limparTodosDados() {
  try {
    await db.animals.clear();
    console.log("🗑️ Todos os dados foram excluídos do SQLite!");
  } catch (err) {
    console.error("❌ Erro ao limpar dados:", err);
  }
}

export async function excluirPorRgn(rgn: string) {
  try {
    await db.animals.where("animal.rgn").equals(rgn).delete();
    console.log(`🗑️ Registro com RGN ${rgn} excluído.`);
  } catch (err) {
    console.error("❌ Erro ao excluir registro:", err);
  }
}
