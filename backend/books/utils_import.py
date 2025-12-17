import pandas as pd
from .models import BookModel, Category
from inventory.models import Shelf

def import_books_from_file(file):
    try:
        if file.name.endswith(".csv"):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
        
        for _,row in df.iterrows():
            category = None
            if "category" in row and pd.notna(row['category']):
                category, _ = Category.objects.get_or_create(name = row['category'])
        
            shelf = None
            if 'shelf' in row and pd.notna(row['shelf']):
                try:
                    shelf = Shelf.objects.get(name = row['shelf'])
                except:
                    continue

            BookModel.objects.update_or_create(
                isbn=row["isbn"],
                defaults={
                    "title": row["title"],
                    "author": row["author"],
                    "publication_year": row.get("publication_year"),
                    "description": row.get("description", ""),
                    "category": category,
                    "shelf": shelf,
                    "available": True,
                },
            )
        return True
    except Exception as e:
        return False, str(e)
