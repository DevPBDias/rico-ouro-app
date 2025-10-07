import { AnimalData, db } from "@/lib/db";

export async function salvarDados(dados: AnimalData[]) {
  try {
    await db.animalData.bulkPut(dados);
    console.log("✅ Dados salvos no IndexedDB:", dados);
  } catch (error) {
    console.error("❌ Erro ao salvar no IndexedDB:", error);
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

      // Verifica se já existe um registro com o mesmo RGN
      const existente = await db.animalData
        .where("animal.rgn")
        .equals(item.animal.rgn)
        .first();

      if (existente) {
        // Atualiza o registro existente, preservando dados importantes
        const merged: AnimalData = {
          ...existente,
          ...item,
          animal: {
            ...existente.animal,
            ...item.animal,
            // Preserva dados que podem ter sido adicionados manualmente
            pesosMedidos: existente.animal.pesosMedidos ?? [],
            circunferenciaEscrotal:
              existente.animal.circunferenciaEscrotal ?? [],
            updatedAt: new Date().toISOString(),
          },
        };

        await db.animalData.put({ ...merged, id: existente.id! });
        atualizados++;
        console.log(`🔄 Atualizado: RGN ${item.animal.rgn}`);
      } else {
        // Insere novo registro
        const toInsert: AnimalData = {
          ...item,
          animal: {
            ...item.animal,
            pesosMedidos: [],
            circunferenciaEscrotal: [],
            updatedAt: new Date().toISOString(),
          },
        };

        await db.animalData.add(toInsert);
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
    await db.animalData.clear();
    console.log("🗑️ Todos os dados foram excluídos do IndexedDB!");
  } catch (err) {
    console.error("❌ Erro ao limpar dados:", err);
  }
}

export async function excluirPorRgn(rgn: string) {
  try {
    await db.animalData.where("animal.rgn").equals(rgn).delete();
    console.log(`🗑️ Registro com RGN ${rgn} excluído.`);
  } catch (err) {
    console.error("❌ Erro ao excluir registro:", err);
  }
}
