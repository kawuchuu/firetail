import {reactive} from "vue";

const favouriteIds = reactive(new Set<string>());

function load() {
    favouriteIds.clear();
    for (const id of window.favourites.getIds()) favouriteIds.add(id);
}

load();
window.favourites.onRefresh(load);

export function isFavourite(songId?: string) {
    return !!songId && favouriteIds.has(songId);
}

export function setFavourite(songId: string, favourite: boolean) {
    if (favourite) favouriteIds.add(songId);
    else favouriteIds.delete(songId);
    window.favourites.set(songId, favourite);
}

export function toggleFavourite(songId: string) {
    setFavourite(songId, !isFavourite(songId));
}
