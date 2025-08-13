import random
import json
from datetime import datetime
import os

# Names lists
first_names = [
    "Benjamin", "Kira", "Jadzia", "Julian", "Miles", "Quark", "Odo", "Worf", "Ezri", "Jake",
    "Rom", "Nog", "Garak", "Dukat", "Weyoun", "Damar", "Morn", "Leeta", "Kasidy", "Martok",
    "Jean-Luc", "William", "Data", "Deanna", "Beverly", "Geordi", "Wesley", "Guinan", "Ro", "Lwaxana",
    "Reginald", "Tasha", "Katherine", "Alexander", "Keiko", "Q", "Lore", "Hugh", "Sela", "Lursa",
    "Kathryn", "Chakotay", "Tuvok", "Tom", "Harry", "Seven", "Neelix", "Kes", "Belanna", "EMH",
    "Naomi", "Icheb", "Seska", "Joe", "Vorik", "Samantha", "Lon", "Chell", "Ayala", "Dalby",
    "Jonathan", "TPol", "Charles", "Malcolm", "Hoshi", "Travis", "Phlox", "Shran", "Porthos", "Daniels",
    "Silik", "Hayes", "Maxwell", "Kelby", "Erika", "Degra", "Dolim", "Malik", "Persis", "Lorian",
    "John", "Cortana", "Avery", "Catherine", "Miranda", "Jacob", "Thomas", "Edward", "Kurt", "Jorge",
    "Emile", "Carter", "Jun", "Noble", "Thel", "Rtas", "Jameson", "Chips", "Roland", "Serina"
]

last_names = [
    "Sisko", "Nerys", "Dax", "Bashir", "O'Brien", "Rozhenko", "Tigan", "Garak", "Dukat", "Picard",
    "Riker", "Troi", "Crusher", "LaForge", "Pulaski", "Yar", "Barclay", "Soong", "Janeway", "Paris",
    "Kim", "Hansen", "Torres", "Wildman", "Carey", "Archer", "Tucker", "Reed", "Sato", "Mayweather",
    "Sierra", "Keyes", "Halsey", "Ackerson", "Lasky", "Vadam", "Vadum", "Locke", "Palmer", "Buck",
    "Forge", "Dare", "Dubbo", "Reynolds", "Stacker", "Mendoza", "McKay", "Silva", "Mendez", "Chief"
]

username_styles = [
    lambda f, l: f"{f}{l}",  
    lambda f, l: f"{f}{random.randint(5, 69)}",  # James42
    lambda f, l: f"{f[0]}{l}",  # JSmith
    lambda f, l: f"{f.lower()}_{l.lower()}",  # james_smith
    lambda f, l: f"{f}{random.randint(2000, 2024)}"  # James2024
]

# List of all  categories
categories = [
    "ancient_greek_philosophers", "australian_prime_ministers", "best_picture_winning_movies",
    "bird_species", "board_games", "canadian_prime_ministers", "capital_cities", "card_games",
    "cat_breeds", "constellations", "countries", "deserts", "divisions_of_geologic_time",
    "dog_breeds", "domesticated_animals", "english_monarchs", "fiction_genres",
    "film_and_television_directors", "fish_species", "historical_treaties", "horse_breeds",
    "islands", "notable_inventors"
]

# Sample words for each category 
sample_words = {
    "historical_treaties": [
        "francomonegasquetreaty", "treatyofsaintpetersburg", "treatyofgyehae", "secondtreatyofbromsebro"
    ],
    "capital_cities": [
        "cairo", "apia", "asmara", "portofspain"
    ],
    "australian_prime_ministers": [
        "robertmenzies", "frankforde", "juliagillard", "josephcook"
    ],
    "islands": [
        "chiloeisland", "southamptonisland", "alorisland", "bali"
    ],
    "english_monarchs": [
        "henrytheyoungking", "georgeii", "henryii", "eadwig"
    ],
    "constellations": [
        "equuleus", "canisminor", "lynx", "mensa"
    ],
    "best_picture_winning_movies": [
        "forrestgump", "hamlet", "thesoundofmusic", "theartist"
    ],
    "countries": [
        "unitedrepublicoftanzania", "ghana", "lebanon", "guinea"
    ],
    "ancient_greek_philosophers": [
        "aristippustheyounger", "panaetius", "eudemusofrhodes", "diotimaofmantinea"
    ],
    "cat_breeds": [
        "suphalak", "germanrex", "sphynx", "chartreux"
    ],
    "board_games": [
        "kingscribbage", "packstack", "dontbreaktheice", "spacehop"
    ],
    "dog_breeds": [
        "roughcollie", "russiantoy", "basenji", "dobermann"
    ],
    "bird_species": [
        "olomao", "antthrush", "swallow", "treepie"
    ],
    "moons_and_planets": [
        "ijiraq", "galatea", "himalia", "amalthea"
    ],
    "human_organs": [
        "uterus", "parotidglands", "pharynx", "fallopiantubes"
    ],
    "presidents_of_the_united_states": [
        "warrengharding", "barackobama", "williamhenryharrison", "georgewashington"
    ],
    "notable_inventors": [
        "franzsangalli", "anatoljosepho", "lorigreiner", "ferdinandvonzeppelin"
    ],
    "domesticated_animals": [
        "rabbit", "whitetailed", "balicattle", "european"
    ],
    "film_and_television_directors": [
        "vladimirdanilevich", "romancoppola", "dufferbrothers", "stephgreen"
    ],
    "types_of_waterbody": [
        "pothole", "barachois", "bog", "broad"
    ],
    "horse_breeds": [
        "bashkirhorse", "akhalteke", "belgiandraught", "coloradoranger"
    ],
    "fish_species": [
        "yellowperch", "remora", "carp", "tubeeye"
    ],
    "deserts": [
        "laguajiradesert", "arabiandesert", "ramlatalsabatayn", "kubuqidesert"
    ],
    "types_of_rock": [
        "evaporite", "blueschist", "andesite", "trachyandesite"
    ],
    "card_games": [
        "quodlibet", "troggu", "reunion", "king"
    ],
    "fiction_genres": [
        "fantasyofmanners", "comedyhorror", "spaceopera", "erotic"
    ],
    "canadian_prime_ministers": [
        "joeclark", "lesterbpearson", "alexandermackenzie", "stephenharper"
    ],
    "divisions_of_geologic_time": [
        "phanerozoic", "telychian", "orosirian", "chattian"
    ],
    "periodic_elements": [
        "protactinium", "bohrium", "curium", "rubidium"
    ],
    "seas": [
        "rosssea", "liguriansea", "yellowsea", "seaofthehebrides"
    ],
    "human_bones": [
        "parietal", "distalphalanxofthumb", "fibula", "proximalphalanxoffifthtoe"
    ],
    "olympic_sports": [
        "roadcycling", "canoeslalom", "bmxfreestyle", "lacrosssixes"
    ]
}

def generate_username():
    first = random.choice(first_names)
    last = random.choice(last_names)
    style = random.choice(username_styles)
    return style(first, last)

def create_user_json(username, password_idx):
    # Get random word for each category
    answers = {}
    longest_word = ""

    for category in categories:
       
        if category in sample_words:
            word = random.choice(sample_words[category])
        else:
            word = f"example_{category}_word"

        time = random.randint(3400, 6969)  # Random time between 1-7 seconds
        answers[category] = {
            "word": word,
            "time": time
        }
        if len(word) > len(longest_word):
            longest_word = word

    # Create user document
    user = {
        "username": username,
        "password": f"$2b$10$examplehashedpassword{password_idx}", 
        "created": datetime.utcnow().isoformat(),
        "answers": answers,
        "longest_word": longest_word,
        "total_score": random.randint(1, 150),
        "high_score": random.randint(10, 50),
        "games": random.randint(1, 10),
        "wins": random.randint(1, 4)
    }

    return user

def create_multiple_user_files(num_users):
    # Create output directory if it doesn't exist
    output_dir = "user_data"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    created_usernames = set()
    users = []

    for i in range(num_users):
        while True:
            username = generate_username()
            if username not in created_usernames:
                created_usernames.add(username)
                break

        user = create_user_json(username, i)
        users.append(user)

        # Save individual user file
        with open(f"{output_dir}/user_{i}.json", 'w') as f:
            json.dump(user, f, indent=2)
        print(f"Created user JSON file: user_{i}.json")

    # Save all users in one file
    with open(f"{output_dir}/all_users.json", 'w') as f:
        json.dump(users, f, indent=2)
    print(f"Created combined JSON file: all_users.json")

# Create 10 users
create_multiple_user_files(10)