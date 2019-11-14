import json

import wikipedia as wp
from marvel import config


def get_character_pages(character_name):
    all_pages = wp.search(character_name)
    if all_pages == []:
        try:
            all_pages = wp.search(wp.suggest(character_name))
        except:
            all_pages = []
    return {'name': character_name, 'pages': all_pages}


def main():
    mcu_characters = [c.rstrip() for c in (config.cleandata / 'mcu_characters.txt').open()]
    mcu_char_pages = [get_character_pages(c) for c in mcu_characters]

    with (config.rawdata / 'all_character_pages.json').open('w') as f:
        json.dump(mcu_char_pages, f)


if __name__ == '__main__':
    main()
