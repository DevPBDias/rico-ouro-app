import { MyDatabase } from "./collections";
import { replicateAnimals } from "./replications/animal.replication";
import { replicateVaccines } from "./replications/vaccine.replication";
import { replicateFarms } from "./replications/farm.replication";
import { replicateAnimalMetricWeight } from "./replications/animal_metric_weight.replication";
import { replicateAnimalMetricCE } from "./replications/animal_metric_ce.replication";
import { replicateAnimalVaccines } from "./replications/animal_vaccine.replication";
import { replicateReproductionEvents } from "./replications/reproduction_event.replication";
import { replicateAnimalStatuses } from "./replications/animal_status.replication";
import { replicateSemenDoses } from "./replications/semen_dose.replication";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("placeholder") || key === "placeholder") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes("supabase")) {
      console.error("❌ Invalid Supabase URL format:", url);
      return null;
    }
  } catch (error) {
    console.error("❌ Invalid Supabase URL:", url);
    return null;
  }

  return { url, key };
}

async function checkSupabaseHealth(url: string, key: string): Promise<boolean> {
  try {
    console.log("🏥 Checking Supabase health...");

    const response = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const isHealthy = response.ok || response.status === 404;
    console.log(
      `🏥 Supabase health check: ${isHealthy ? "✅ OK" : "❌ FAILED"}`
    );

    return isHealthy;
  } catch (error) {
    console.error("❌ Supabase health check failed:", error);
    return false;
  }
}

export async function setupReplication(db: MyDatabase) {
  console.log("🔄 Setting up replication...");

  const config = getSupabaseConfig();

  if (!config) {
    console.warn(
      "⚠️ Supabase not configured properly. Replication disabled.\n" +
        "   This is normal in development if you haven't set up Supabase yet.\n" +
        "   The app will work in offline-only mode.\n" +
        "   To enable sync, configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return;
  }

  const { url: SUPABASE_URL, key: SUPABASE_KEY } = config;

  checkSupabaseHealth(SUPABASE_URL, SUPABASE_KEY).then((isHealthy) => {
    if (!isHealthy) {
      console.warn(
        "⚠️ Supabase unreachable initially. Replication will retry automatically when online."
      );
    }
  });

  try {
    const animalsCount = await db.animals.count().exec();
    console.log(`📊 [Animals] Local count before sync: ${animalsCount}`);

    const animalsReplication = await replicateAnimals(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const vaccinesReplication = await replicateVaccines(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const farmsReplication = await replicateFarms(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const animalMetricsWeightReplication = await replicateAnimalMetricWeight(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const animalMetricsCEReplication = await replicateAnimalMetricCE(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const animalVaccinesReplication = await replicateAnimalVaccines(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const reproductionEventsReplication = await replicateReproductionEvents(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const animalStatusesReplication = await replicateAnimalStatuses(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const semenDosesReplication = await replicateSemenDoses(
      db,
      SUPABASE_URL,
      SUPABASE_KEY
    );

    (db as any).replications = {
      animals: animalsReplication,
      vaccines: vaccinesReplication,
      farms: farmsReplication,
      animal_metrics_weight: animalMetricsWeightReplication,
      animal_metrics_ce: animalMetricsCEReplication,
      animal_vaccines: animalVaccinesReplication,
      reproduction_events: reproductionEventsReplication,
      animal_statuses: animalStatusesReplication,
      semen_doses: semenDosesReplication,
    };

    console.log("✅ Replication setup complete");

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Online detected - forcing replication retry");
        animalsReplication.reSync();
        vaccinesReplication.reSync();
        farmsReplication.reSync();
        animalMetricsWeightReplication.reSync();
        animalMetricsCEReplication.reSync();
        animalVaccinesReplication.reSync();
        reproductionEventsReplication.reSync();
        animalStatusesReplication.reSync();
        semenDosesReplication.reSync();
      });
    }

    let animalsErrorCount = 0;
    const MAX_ERRORS = 5;

    animalsReplication.error$.subscribe((error) => {
      if (error) {
        animalsErrorCount++;
        console.error(
          `❌ [Animals] Replication error (${animalsErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (animalsErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Animals] High error rate, but keeping replication alive for retry."
          );
        }
      }
    });

    animalsReplication.active$.subscribe((active) => {
      console.log(`🔄 [Animals] Replication active: ${active}`);
      if (active) {
        animalsErrorCount = 0; // Reset error count on successful activity
      }
    });

    // Vaccines error handling
    let vaccinesErrorCount = 0;
    vaccinesReplication.error$.subscribe((error) => {
      if (error) {
        vaccinesErrorCount++;
        console.error(
          `❌ [Vaccines] Replication error (${vaccinesErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (vaccinesErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Vaccines] High error rate, but keeping replication alive for retry."
          );
        }
      }
    });

    vaccinesReplication.active$.subscribe((active) => {
      if (active) {
        vaccinesErrorCount = 0;
      }
    });

    // Farms error handling
    let farmsErrorCount = 0;
    farmsReplication.error$.subscribe((error) => {
      if (error) {
        farmsErrorCount++;
        console.error(
          `❌ [Farms] Replication error (${farmsErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (farmsErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Farms] High error rate, but keeping replication alive for retry."
          );
        }
      }
    });

    farmsReplication.active$.subscribe((active) => {
      if (active) {
        farmsErrorCount = 0;
      }
    });
  } catch (error) {
    console.error("❌ Replication setup error:", error);
    console.warn("⚠️ App will continue in offline-only mode");
  }
}
