const baseUrl = 'http://www.soundcla.sh/clashes.json';


export const loadClashes = () => {
    return fetch(baseUrl, {
        mode: 'cors',
        headers: new Headers({
            'Access-Control-Allow-Origin': '*'
        })
    }).then(res => res.json());
}
