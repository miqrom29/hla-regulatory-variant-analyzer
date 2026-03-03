import requests
import streamlit as st

# ----------------- Configuración básica -----------------
st.set_page_config(page_title="HLA Regulatory Variant Analyzer", page_icon="🧬")

st.title("HLA Regulatory Variant Analyzer")
st.write(
    "Herramienta experimental para explorar el posible impacto regulatorio de variantes "
    "en la región HLA usando un modelo open-source (Mistral-7B-Instruct) vía Hugging Face."
)

st.sidebar.header("Configuración del modelo")

# Por defecto, Mistral-7B-Instruct v0.2
model = st.sidebar.text_input(
    "Modelo HF (text-generation)",
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

# ----------------- Datos de entrada HLA -----------------
st.subheader("Datos de entrada")

hla_genotype = st.text_input(
    "HLA genotipo (ej. HLA-A*01:01; HLA-B*08:01; HLA-C*07:01)",
)

variant = st.text_input(
    "Variante regulatoria (rsID o pos/ref/alt)",
    help="Ej. rs12345-A, o chr6:32500000 A>G",
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

def build_mistral_inst_prompt(system_prompt, user_prompt):
    """
    Mistral Instruct usa formato tipo:
    <s>[INST] <<SYS>> ... <</SYS>> instrucción [/INST]
    """
    sys_block = f"<<SYS>>\n{system_prompt}\n<</SYS>>\n\n"
    inst = sys_block + user_prompt
    full = f"<s>[INST] {inst} [/INST]"
    return full

# ----------------- Llamada a Hugging Face (Mistral) -----------------
def call_hf_mistral(system_prompt, user_prompt):
    if not hf_api_key:
        return "Falta la HF API key. Añádela en Secrets o en el sidebar."

    headers = {
        "Authorization": f"Bearer {hf_api_key}",
        "Content-Type": "application/json",
    }

    prompt = build_mistral_inst_prompt(system_prompt, user_prompt)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 800,
            "temperature": 0.4,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False,
        },
    }

    url = f"https://api-inference.huggingface.co/models/{model}"
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        r.raise_for_status()
    except Exception as e:
        return f"Error al llamar a Hugging Face: {e}\nRespuesta: {getattr(r, 'text', '')}"

    data = r.json()
    # Formato típico: [{"generated_text": "..."}]
    if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
        return data[0]["generated_text"].strip()
    return str(data)

# ----------------- Chat -----------------
if user_query := st.chat_input("Pregunta sobre el impacto regulatorio, o pide un resumen general."):
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    with st.chat_message("assistant"):
        with st.spinner("Analizando con Mistral vía Hugging Face..."):
            system_prompt = build_system_prompt()
            user_prompt = build_user_prompt(hla_genotype, variant, extra_context, user_query)
            response = call_hf_mistral(system_prompt, user_prompt)
            st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})
