
I am writing my bipolar disorder mood diary into NocoDB running on my Linux server at http://192.168.50.191:33860 where I have my "mood diary" table with ID: mvj3iz12lui2i2h
Now, the problem I am trying to solve is this: I want this NocoDB table to be better, for viewing, as NocoDB itself isn't really great at viewing these data, especially like bipolar disorder data, that gets buried inside the fields, if they are longer (like symptoms, or notes). So I am looking for a way, using API to fetch the table data from NocoDB and display them easily on widescreen 16:9 displays and each column, having all the data visible (they won't get cropped or stuffed inside the table cell), I am just looking for modern, simple, subtle and positive design to display these data, especially for my psychiatrist. And also, if possible, doing an print version into in landscape oriented PDF to A4 (but, I am not really sure, if it'll fit). At the top, I would love if there would be options to sort (default by date with latest entries on top), then filter or view by date range (month, two months, three months, six months, year, all time). So I would do that for starters.
Web view and functionality is priority, PDF and printing can be done AFTER we have this working. 
For PDF print: we already build something similar and it worked at: C:\Users\martz\Desktop\apps\tracker-app

Also, I would love to copy deployment from here: C:\Users\martz\Desktop\apps\tracker-app which works great (check especially deploy.sh, backup.sh, docker-compose.yml and Dockerfile)

So, I think we should do nextjs + tailwind like in: C:\Users\martz\Desktop\apps\tracker-app, same stack. 

**Notes**:
- app should be completely in Czech language
- NocoDB API key is: LehBM_s0bzNbhywtVYr_egxfe4AM3h75yLulZif3
- Deployment will be on Linux Mint Server, but development is here on Windows 11