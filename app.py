import streamlit as st
# importa aquí tus módulos locales cuando los tengas:
# from core import load_hla_data, annotate_variant, ...

from openai import OpenAI
import anthropic
import requests

st.set_page_config(page_title="HLA Regulatory Variant Analyzer", page_icon="🧬")
st.title("HLA Regulatory Variant Analyzer")

# Sidebar: proveedor/modelo (igual que antes)
# ... [mismo bloque de provider/model/model keys que en el starter] ...

# Entrada específica HLA
st.subheader("Datos de entrada")

hla_genotype = st.text_input(
    "HLA genotipo (ej. HLA-A*01:01; HLA-B*08:01; HLA-C*07:01)",
    help="Puedes pegar varios loci separados por ';'."
)

variant = st.text_input(
    "Variante regulatoria (rsID o pos/ref/alt)",
    help="Ej. rs12345-A, o chr6:32500000 A>G"
)

extra_context = st.text_area(
    "Contexto clínico / funcional (opcional)",
    help="Por ejemplo: tipo de enfermedad, tejido, expresión conocida, etc."
)

# Historial de chat (para ir refinando la anotación)
if "messages" not in st.session_state:
    st.session_state.messages = []

for m in st.session_state.messages:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

def build_system_prompt():
    return (
        "Eres un experto en genética HLA y variantes regulatorias. "
        "Debes analizar el posible impacto de variantes en la región del MHC "
        "sobre la regulación de genes HLA (promotores, enhancers, eQTL, etc.). "
        "No inventes datos concretos de papers si no los recuerdas; habla en términos generales, "
        "e indica claramente cuando algo es especulativo."
    )

def build_user_prompt(hla_genotype, variant, extra_context, user_query):
    base = f"HLA genotipo: {hla_genotype}\nVariante regulatoria: {variant}\n"
    if extra_context:
        base += f"Contexto adicional: {extra_context}\n"
    base += f"Pregunta del usuario: {user_query}\n"
    base += (
        "Devuelve:\n"
        "- Posibles mecanismos regulatorios implicados (promotor, enhancer, splicing, miRNA binding, etc.).\n"
        "- Si conoces ejemplos típicos en HLA similares, descríbelos de forma general.\n"
        "- Un resumen final claro en lenguaje no excesivamente técnico."
    )
    return base

# Aquí reutilizas los helpers de llamada OpenAI/Anthropic/HF del starter,
# pero pasándoles system_prompt + user_prompt en vez de todo el historial "crudo".
# (copias las funciones call_openai, call_anthropic, call_hf y las adaptas a system+user)

if user_query := st.chat_input("Pregunta sobre el impacto regulatorio, o deja en blanco y pide un resumen general."):
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    with st.chat_message("assistant"):
        with st.spinner("Analizando..."):
            system_prompt = build_system_prompt()
            user_prompt = build_user_prompt(hla_genotype, variant, extra_context, user_query)
            # Aquí llamas a generate_response(system_prompt, user_prompt)
            # que internamente usa el proveedor seleccionado.
            response = "...respuesta del modelo..."
            st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})
