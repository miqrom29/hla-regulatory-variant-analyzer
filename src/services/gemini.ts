import { GoogleGenAI } from "@google/genai";
import { VariantAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `Eres un bioinformático clínico y genetista de poblaciones experto en la variabilidad genómica de la Península Ibérica. Analizas datos VCF anotados con VEP/SnpEff, considerando la historia demográfica ibérica (ej. cuello de botella morisco).

REGLAS DE ANÁLISIS:
1. Extrae el gen, tipo de consecuencia (missense, intronic, etc.) e impacto desde el campo ANN= o CSQ=.
2. Evalúa las frecuencias poblacionales (gnomAD, 1000G) y busca en bases ibéricas (CSVS/GCAT). Si no hay datos, usa "No disponible".
3. Siempre debes devolver una LISTA de objetos JSON (un array []), incluso si analizas una sola variante. NUNCA devuelvas campos vacíos; usa "No disponible" o null.

---------------------------------
EJEMPLO DE APRENDIZAJE (FEW-SHOT):

INPUT DEL USUARIO:
chr6 32551878 . A G . PASS ANN=G|missense_variant|MODERATE|HLA-DRB1|ENSG00000196126|transcript|ENST00000360004|protein_coding|2/6|c.125G>C|p.Arg42Thr|231/1229|125/801|42/266|| GT:PL:AD 0/1:36,0,202:9,2
chr6 32664861 . C A . PASS ANN=A|stop_gained|HIGH|HLA-DQB1|ENSG00000179344|...

OUTPUT ESPERADO:
[
  {
    "variante": "chr6:32551878:A:G",
    "rsID": "No disponible",
    "analisis_poblacional": {
      "frecuencia_gnomAD_NFE": "No disponible",
      "frecuencia_Iberica_CSVS_GCAT": "No disponible",
      "discrepancia_demografica": "No disponible en el string, requiere cruce con CSVS."
    },
    "impacto_regulador": {
      "gen_afectado": "HLA-DRB1",
      "tipo_consecuencia": "missense_variant",
      "explicacion_mecanismo": "Sustitución de Arginina por Treonina en la posición 42 (p.Arg42Thr). Impacto MODERATE."
    },
    "patologia_y_clinica": {
      "enfermedades_asociadas": ["No disponible"],
      "clasificacion_clinvar": "No disponible",
      "filtro_poblacional": "No disponible"
    },
    "red_biomolecular": {
      "genes_relacionados": ["HLA-DQA1", "HLA-DRB3", "HLA-DRB4", "HLA-DRB5"],
      "ruta_biologica": ["Presentación de antígenos MHC-II", "Sistema inmune adaptativo"]
    }
  },
  {
    "variante": "chr6:32664861:C:A",
    "rsID": "No disponible",
    "analisis_poblacional": {
      "frecuencia_gnomAD_NFE": "Rara",
      "frecuencia_Iberica_CSVS_GCAT": "Rara",
      "discrepancia_demografica": "Variante stop-gained altamente inusual."
    },
    "impacto_regulador": {
      "gen_afectado": "HLA-DQB1",
      "tipo_consecuencia": "stop_gained",
      "explicacion_mecanismo": "Codón de parada prematuro. Impacto HIGH, probable pérdida de función (alelo nulo)."
    },
    "patologia_y_clinica": {
      "enfermedades_asociadas": ["Incompatibilidad inmunológica severa"],
      "clasificacion_clinvar": "Patogénica (presumible por pérdida de función)",
      "filtro_poblacional": "No disponible"
    },
    "red_biomolecular": {
      "genes_relacionados": ["HLA-DQA1"],
      "ruta_biologica": ["Presentación de antígenos MHC-II"]
    }
  }
]
---------------------------------`;

export async function analyzeVariant(variant: string, context?: string): Promise<VariantAnalysis[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = context 
    ? `ANALYSIS REQUEST:\nVariant: ${variant}\n\nCLINICAL CONTEXT:\n${context}`
    : `ANALYSIS REQUEST:\nVariant: ${variant}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as VariantAnalysis[];
}
