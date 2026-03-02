import React, { useState } from "react";
import { Terminal, Search, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onAnalyze: (variant: string, context?: string) => void;
  isLoading: boolean;
}

export default function VariantInput({ onAnalyze, isLoading }: Props) {
  const [variant, setVariant] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (variant.trim()) {
      onAnalyze(variant, context);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <Terminal size={16} />
        <h3 className="col-header">Genomic Data Input</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono opacity-50">Variant Data (VCF / rsID / JSON)</label>
          <textarea
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="e.g. chr6:32551878 A>G or rs7412"
            className="w-full h-24 p-3 terminal-input resize-none text-sm placeholder:opacity-30"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono opacity-50">Clinical & Demographic Context (Optional)</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe origin, phenotype, family history..."
            className="w-full h-32 p-3 terminal-input resize-none text-sm placeholder:opacity-30 border-dashed"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => {
                setVariant("chr6:32489163 G>A");
                setContext("[ANÁLISIS REGULATORIO]\n- Región: 5' UTR de HLA-DRA\n- Objetivo: Evaluar disrupción de promotor y TFBS en población ibérica.");
              }}
              className="text-[9px] font-mono px-2 py-1 border border-line/20 hover:border-line transition-colors"
            >
              Regulatory Example
            </button>
            <button 
              type="button"
              onClick={() => {
                setVariant("chr6:32551878 A>G");
                setContext("[CONTEXTO CLÍNICO]\n- Origen: España (Iberia)\n- Fenotipo: Incompatibilidad transfusional\n- HLA: DRB1*09:01");
              }}
              className="text-[9px] font-mono px-2 py-1 border border-line/20 hover:border-line transition-colors"
            >
              HLA Case Study
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !variant.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            {isLoading ? "Processing..." : "Run Analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
