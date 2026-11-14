from backend.llm.catalog import CANDIDATE_MODELS


def test_exactly_five_configured_ollama_models() -> None:
    tags = {candidate.tag for candidate in CANDIDATE_MODELS}
    assert len(CANDIDATE_MODELS) == 5
    assert tags == {
        "qwen2.5:0.5b",
        "qwen3:0.6b",
        "smollm2:1.7b-instruct-q4_K_M",
        "phi3:mini",
        "deepseek-r1:1.5b",
    }
