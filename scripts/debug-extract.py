import importlib.util

spec = importlib.util.spec_from_file_location(
    "sync", r"E:\bencao-system\bencao-system\scripts\sync-wiki-source-images.py"
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
u = "https://www.cntcm.com.cn/content/202604/27/c502233.html"
print("prefix", m.article_path_prefix(u))
print("extract", m.extract_article_images(u))
