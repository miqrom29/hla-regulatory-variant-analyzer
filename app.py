import streamlit as st
from openai import OpenAI  # Cliente OpenAI, pero apuntando a Hugging Face router

# ----------------- Configuración básica -----------------
st.set_page_config(page_title="HLA Regulatory Variant Analyzer", page_icon="🧬")

st.title("HLA Regulatory Variant Analyzer")
st.write(
    "Herramienta experimental para explorar el posible impacto regulatorio de variantes "
    "en la región HLA usando un modelo open-source (Mistral-7B-Instruct) vía Hugging Face (router)."
)

st.sidebar.header("Configuración del modelo")

# Modelo por defecto: Mistral-7B-Instruct
model = st.sidebar.text_input(
    "Modelo HF (chat / text-generation)",
    value="mistralai/Mistral-7B-Instruct-v0.2",
    help="Modelo instruct en Hugging Face. Puedes dejar el valor por defecto.",
)

# ----------------- API key de Hugging Face -----------------
def get_hf_key():
    val = None
    if "secrets" in dir(st):
        val = st.secrets.get("HF_API_KEY", None)
    if val is None:
        val = st.sidebar.text_input("HF API key", type="password")
    return val

hf_api_key = get_hf_key()

# Cliente OpenAI apuntando al router de Hugging Face
client = None
if hf_api_key:
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=hf_api_key,
    )

# ----------------- Datos de entrada HLA -----------------
st.subheader("Datos de entrada")

hla_genotype = st.text_input(
    "HLA genotipo (ej. HLA-A*01:01; HLA-B*08:01; HLA-C*07:01)",
)

variant = st.text_input(
    "Variante regulatoria (rsID o pos/ref/alt)",
    help="Ej. rs12345-A, o chr6:32584134 CA/AC",
)

extra_context = st.text_area(
    "Contexto clínico / funcional (opcional)",
    help="Ej. enfermedad, tejido, expresión conocida, ancestría, etc.",
)

st.markdown(
    "> Aviso: esta herramienta es solo para **uso exploratorio/investigación**. "
    "No proporciona diagnóstico médico ni recomendaciones clínicas."
)

# ----------------- Historial de chat -----------------
if "messages" not in st.session_state:
    st.session_state.messages = []

for m in st.session_state.messages:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

# ----------------- Construcción del prompt -----------------
def build_system_prompt():
    return (
        "Eres un experto en genética HLA y variantes regulatorias en la región MHC. "
        "Analizas cómo variantes en promotores, enhancers, sitios de unión de factores de transcripción, "
        "eQTLs, splicing y otros mecanismos pueden modular la expresión de alelos HLA. "
        "No des diagnósticos médicos ni recomendaciones terapéuticas; limita tu respuesta "
        "a consideraciones mecanísticas y de biología molecular. "
        "Indica claramente cuando algo sea especulativo por falta de evidencia."
    )

def build_user_prompt(hla_genotype, variant, extra_context, user_query):
    base = "Información de contexto:\n"
    base += f"- HLA genotipo: {hla_genotype or 'no especificado'}\n"
    base += f"- Variante regulatoria: {variant or 'no especificada'}\n"
    if extra_context:
        base += f"- Contexto adicional: {extra_context}\n"
    base += "\nTarea:\n"
    base += (
        "1) Describe posibles mecanismos regulatorios implicados (promotor, enhancer, splicing, miRNA binding, eQTL, etc.).\n"
        "2) Comenta, de forma general, ejemplos típicos conocidos en HLA (sin inventar papers concretos).\n"
        "3) Da un resumen final claro y conciso en lenguaje comprensible para genetistas clínicos.\n"
    )
    if user_query:
        base += f"\nPregunta específica del usuario: {user_query}\n"
    return base

# ----------------- Llamada al router de HF (OpenAI-style) -----------------
def call_hf_router(system_prompt, user_prompt):
    if client is None:
        return "Falta la HF API key. Añádela en Secrets o en el sidebar."

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=800,
            temperature=0.4,
            top_p=0.9,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error al llamar al router de Hugging Face: {e}"

# ----------------- Chat -----------------
if user_query := st.chat_input("Pregunta sobre el impacto regulatorio, o pide un resumen general."):
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    with st.chat_message("assistant"):
        with st.spinner("Analizando con Mistral vía Hugging Face router..."):
            system_prompt = build_system_prompt()
            user_prompt = build_user_prompt(hla_genotype, variant, extra_context, user_query)
            response = call_hf_router(system_prompt, user_prompt)
            st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})


