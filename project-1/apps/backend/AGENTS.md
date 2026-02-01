# AGENTS.md

* Będziesz odpowiedzialny za przygotowanie danych statystycznych
* Będziesz operował na plikach (dump'y z wikipedii) znajdujących się w `./src/data/raw`
* Pliki danych to pliki JSON zawierające informacje z czeskiej wikipedii
* Dokonasz analizy statystycznej i przygotujesz poniższe raporty
  * Stworzyc korpus - 100 tyś wyrazów
  * Tabela częstości wyrazów
  * Sprawdzenie czy występuje prawo Zipf'a
  * Rdzeń języka -Umieszczamy na okręgu, robimy graf, krawedzie między słowami, które stoją obok siebie. Rdzeniem języka będą słowa które mają najwięcej połączeń.
  * Znaleźć pierwsze 50 rzeczowników i przetłumaczyć
* Końcowym wynikiem twoich programów musi być plik moliwy do odczytania przez frontend (celujemy w JSON)
* Końcowe pliki zapisz do `./src/data/processed`
* Każda z powyższych operacji powinna znajdować się w osobnym pliku w katalogu `./src/processing`
* Lematizacja oraz tłumaczenia muszą wykorzystywać zewnętrzne biblioteki/usługi NLP – nie tworzymy własnych słowników w kodzie
