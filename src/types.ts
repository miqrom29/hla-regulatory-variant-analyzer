export interface PopulationAnalysis {
  frecuencia_gnomAD_NFE: string | number | null;
  frecuencia_Iberica_CSVS_GCAT: string | number | null;
  discrepancia_demografica: string | null;
}

export interface RegulatoryImpact {
  gen_afectado: string | null;
  tipo_consecuencia: string | null;
  explicacion_mecanismo: string | null;
}

export interface PathologyAndClinical {
  enfermedades_asociadas: string[] | null;
  clasificacion_clinvar: string | null;
  filtro_poblacional: string | null;
}

export interface BiomolecularNetwork {
  genes_relacionados: string[] | null;
  ruta_biologica: string[] | null;
}

export interface VariantAnalysis {
  variante: string;
  rsID: string | null;
  analisis_poblacional: PopulationAnalysis;
  impacto_regulador: RegulatoryImpact;
  patologia_y_clinica: PathologyAndClinical;
  red_biomolecular: BiomolecularNetwork;
}
