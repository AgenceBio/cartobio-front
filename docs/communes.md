# Générer le fichier communes

Données distribuées sur https://www.insee.fr/fr/information/2560452, et actualisées vers la **fin février** de chaque année.

```bash
wget insee.fr/fr/statistiques/fichier/4316069/communes2020-csv.zip
unzip communes2020-csv.zip
cat communes2020.csv | csvcut -c "com,libelle"
```

And then in my IDE, a search/replace with this regex: `^(\d+),(.+)$` -> `{"com": "$1", "libelle": "$2"},`.
