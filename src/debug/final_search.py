import os

search_string = "123456"
root_dir = "d:/Documentos/Projetos Antigravit"

print(f"--- BUSCA EXAUSTIVA POR '{search_string}' ---")

for root, dirs, files in os.walk(root_dir):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    
    for file in files:
        if file.endswith((".js", ".ts", ".json", ".prisma", ".md", ".env", ".jsx", ".tsx")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if search_string in content:
                        print(f"ENCONTRADO: {path}")
                        # Mostrar contexto
                        lines = content.splitlines()
                        for i, line in enumerate(lines):
                            if search_string in line:
                                print(f"  Linha {i+1}: {line.strip()}")
            except Exception:
                pass

print("--- BUSCA CONCLUÍDA ---")
