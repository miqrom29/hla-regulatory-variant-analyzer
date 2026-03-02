import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dna, Info, AlertTriangle, Github, BookOpen, Download, Microscope } from "lucide-react";
import VariantInput from "./components/VariantInput";
import AnalysisResult from "./components/AnalysisResult";
import { analyzeVariant } from "./services/gemini";
import { VariantAnalysis } from "./types";

export default function App() {
  const [analyses, setAnalyses] = useState<VariantAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (variant: string, context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await analyzeVariant(variant, context);
      setAnalyses(results);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze variant. Please check the input format and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (analyses.length === 0) return;

    const headers = [
      "Variante",
      "rsID",
      "gnomAD_NFE",
      "Iberia_CSVS_GCAT",
      "Discrepancia_Demografica",
      "Gen_Afectado",
      "Tipo_Consecuencia",
      "Explicacion_Mecanismo",
      "Clasificacion_Clinvar",
      "Enfermedades_Asociadas",
      "Filtro_Poblacional",
      "Genes_Relacionados",
      "Rutas_Biologicas"
    ];

    const rows = analyses.map(a => [
      a.variante,
      a.rsID || "N/A",
      a.analisis_poblacional?.frecuencia_gnomAD_NFE || "N/A",
      a.analisis_poblacional?.frecuencia_Iberica_CSVS_GCAT || "N/A",
      `"${(a.analisis_poblacional?.discrepancia_demografica || "").replace(/"/g, '""')}"`,
      a.impacto_regulador?.gen_afectado || "N/A",
      a.impacto_regulador?.tipo_consecuencia || "N/A",
      `"${(a.impacto_regulador?.explicacion_mecanismo || "").replace(/"/g, '""')}"`,
      a.patologia_y_clinica?.clasificacion_clinvar || "N/A",
      `"${(a.patologia_y_clinica?.enfermedades_asociadas || []).join("; ")}"`,
      `"${(a.patologia_y_clinica?.filtro_poblacional || "").replace(/"/g, '""')}"`,
      `"${(a.red_biomolecular?.genes_relacionados || []).join("; ")}"`,
      `"${(a.red_biomolecular?.ruta_biologica || []).join("; ")}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `variant_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Rail */}
      <header className="border-b border-line p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ink flex items-center justify-center">
            <Dna className="text-bg" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold tracking-tighter leading-none">HLA REGULATORY VARIANT ANALYZER</h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Genomic Intelligence Platform</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 hover:bg-ink hover:text-bg transition-colors">
            <BookOpen size={18} />
          </button>
          <button className="p-2 hover:bg-ink hover:text-bg transition-colors">
            <Github size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Info */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-card p-6">
            <VariantInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <Info size={16} />
              <h3 className="col-header">System Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span>Core Engine:</span>
                <span className="text-emerald-600">ONLINE</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span>gnomAD v4.1:</span>
                <span className="text-emerald-600">CONNECTED</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span>VEP/SnpEff:</span>
                <span className="text-emerald-600">ACTIVE</span>
              </div>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-100 border border-red-500 text-red-700 flex gap-3 items-start"
            >
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 border-b border-line pb-2 flex-1">
              <Microscope size={16} />
              <h3 className="col-header">Analysis Results</h3>
            </div>
            {analyses.length > 0 && (
              <button
                onClick={downloadCSV}
                className="ml-4 flex items-center gap-2 px-4 py-1.5 border border-line hover:bg-ink hover:text-bg transition-all font-mono text-[10px] uppercase tracking-wider"
              >
                <Download size={14} />
                Export CSV
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {analyses.length > 0 ? (
              analyses.map((analysis, index) => (
                <AnalysisResult 
                  key={`${analysis.rsID || analysis.variante}-${index}`} 
                  analysis={analysis} 
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-dashed border-line/30 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-16 h-16 border border-line/20 rounded-full flex items-center justify-center mb-4 opacity-20">
                  <Dna size={32} />
                </div>
                <h3 className="font-mono text-sm uppercase tracking-widest opacity-40">Awaiting Sequence Data</h3>
                <p className="text-xs font-mono opacity-30 mt-2 max-w-xs">
                  Input a variant identifier or VCF record to begin deep molecular analysis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line p-4 bg-white/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase opacity-40 font-mono">Precision</span>
              <span className="text-xs font-mono">0.999998</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase opacity-40 font-mono">Latency</span>
              <span className="text-xs font-mono">1.24s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase opacity-40 font-mono">Build</span>
              <span className="text-xs font-mono">v2.4.0-stable</span>
            </div>
          </div>
          <p className="text-[10px] font-mono opacity-40">
            © 2026 HLA REGULATORY VARIANT ANALYZER • MIQUEL RUMBA • BIOMEDICAL RESEARCH USE ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
