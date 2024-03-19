const http = require('http');
const https = require('https');

const websiteUrl = 'https://time.com';

function extractTitlesAndLinksFromHtml(html) {
    const titlesAndLinks = [];
    let startIndex = 0;
    let count = 0;

    while (count < 6) {
        // Find the start index of the next title and link
        const titleStartIndex = html.indexOf('<h3 class="latest-stories__item-headline">', startIndex);
        if (titleStartIndex === -1) break;

        const titleEndIndex = html.indexOf('</h3>', titleStartIndex);
        if (titleEndIndex === -1) break;

        const linkStartIndex = html.lastIndexOf('<a href="', titleStartIndex);
        if (linkStartIndex === -1) break;

        const linkEndIndex = html.indexOf('"', linkStartIndex + 9);
        if (linkEndIndex === -1) break;

        // Extract title and link from HTML
        const title = html.substring(titleStartIndex + 42, titleEndIndex);
        const link = websiteUrl + html.substring(linkStartIndex + 9, linkEndIndex);

        titlesAndLinks.push({ title, link });
        count++;

        startIndex = titleEndIndex + 5;
    }

    return titlesAndLinks;
}

const server = http.createServer((req, res) => {
    if (req.url === "/getTimeStories") {
        const protocol = websiteUrl.startsWith('https') ? https : http;

        protocol.get(websiteUrl, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const titlesAndLinks = extractTitlesAndLinksFromHtml(data);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(titlesAndLinks));
                res.end();
            });
        }).on('error', (error) => {
            console.error('Error fetching website:', error);
        });
    }
});

server.listen(3000);

console.log('Listening on port 3000');
