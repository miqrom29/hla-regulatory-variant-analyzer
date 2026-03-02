import React from "react";
import { motion } from "motion/react";
import { VariantAnalysis } from "../types";
import { Activity, Database, Network, ShieldAlert, History, Microscope } from "lucide-react";

interface Props {
  analysis: VariantAnalysis;
}

const AnalysisResult: React.FC<Props> = ({ analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-line pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tighter">
            {analysis.rsID || "VARIANT_ID"}
          </h2>
          <p className="text-xs font-mono opacity-60">{analysis.variante}</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-[10px] font-mono border border-line ${
            analysis.patologia_y_clinica?.clasificacion_clinvar?.toLowerCase().includes('patogénica') ? 'bg-red-500 text-white' : 
            analysis.patologia_y_clinica?.clasificacion_clinvar?.toLowerCase().includes('vus') ? 'bg-orange-400 text-white' : 
            'bg-emerald-500 text-white'
          }`}>
            {analysis.patologia_y_clinica?.clasificacion_clinvar || "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Análisis Poblacional Ibérico */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <History size={16} />
            <h3 className="col-header">Divergencia Poblacional Ibérica</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase opacity-50">gnomAD NFE</p>
                <p className="data-value text-lg">
                  {typeof analysis.analisis_poblacional?.frecuencia_gnomAD_NFE === 'number' 
                    ? `${(analysis.analisis_poblacional.frecuencia_gnomAD_NFE * 100).toFixed(4)}%`
                    : analysis.analisis_poblacional?.frecuencia_gnomAD_NFE || "No disponible"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-50">Iberia (CSVS/GCAT)</p>
                <p className="data-value text-lg">
                  {typeof analysis.analisis_poblacional?.frecuencia_Iberica_CSVS_GCAT === 'number'
                    ? `${(analysis.analisis_poblacional.frecuencia_Iberica_CSVS_GCAT * 100).toFixed(4)}%`
                    : analysis.analisis_poblacional?.frecuencia_Iberica_CSVS_GCAT || "No disponible"}
                </p>
              </div>
            </div>
            <div className="p-2 bg-white/10 border border-line/10">
              <p className="text-[10px] uppercase opacity-50 mb-1">Contexto Demográfico</p>
              <p className="text-xs leading-relaxed italic opacity-80">
                "{analysis.analisis_poblacional?.discrepancia_demografica || "No data available"}"
              </p>
            </div>
          </div>
        </div>

        {/* 2. Impacto Regulador */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <Microscope size={16} />
            <h3 className="col-header">Impacto Genético y Regulador</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase opacity-50">Gen Afectado</p>
              <p className="data-value text-lg">{analysis.impacto_regulador?.gen_afectado || "Unknown"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase opacity-50">Consecuencia (VEP/SnpEff)</p>
              <p className="data-value text-sm">{analysis.impacto_regulador?.tipo_consecuencia || "N/A"}</p>
            </div>
            <p className="text-xs leading-relaxed opacity-80 italic">
              "{analysis.impacto_regulador?.explicacion_mecanismo || "No explanation provided"}"
            </p>
          </div>
        </div>

        {/* 3. Patología y Clínica */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <ShieldAlert size={16} />
            <h3 className="col-header">Patología y Clínica</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase opacity-50">Enfermedades Asociadas</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.patologia_y_clinica?.enfermedades_asociadas?.map(enf => (
                  <span key={enf} className="text-[10px] font-mono px-1.5 border border-line/30 bg-white/20">
                    {enf}
                  </span>
                )) || <span className="text-[10px] opacity-30">None reported</span>}
              </div>
            </div>
            <div className="p-2 bg-white/10 border border-line/10">
              <p className="text-[10px] uppercase opacity-50 mb-1">Filtro Poblacional Ibérico</p>
              <p className="text-xs leading-relaxed italic opacity-80">
                "{analysis.patologia_y_clinica?.filtro_poblacional || "No data"}"
              </p>
            </div>
          </div>
        </div>

        {/* 4. Red Biomolecular */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <Network size={16} />
            <h3 className="col-header">Red Biomolecular y Pleiotropía</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase opacity-50">Genes Relacionados (LD/Co-exp)</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.red_biomolecular?.genes_relacionados?.map(gene => (
                  <span key={gene} className="text-[10px] font-mono px-1.5 border border-line/30 bg-white/20">
                    {gene}
                  </span>
                )) || <span className="text-[10px] opacity-30">None</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase opacity-50">Rutas Biológicas (KEGG/Reactome)</p>
              <ul className="text-[10px] font-mono space-y-1 mt-1">
                {analysis.red_biomolecular?.ruta_biologica?.map(path => (
                  <li key={path} className="flex items-start gap-1">
                    <span className="mt-1 w-1 h-1 bg-line rounded-full flex-shrink-0" />
                    {path}
                  </li>
                )) || <li className="opacity-30">No data</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;
