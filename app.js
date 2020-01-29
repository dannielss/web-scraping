const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config()
const Info = require('./src/models/Info');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-5pniq.mongodb.net/db_smallville`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,    
})

request.post('http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTramite', 
    { form: { ID: 20, dsTexto: 'transporte'} }, 
    function(err, response, html) {
        if(response.statusCode === 200) {
            const $ = cheerio.load(html);

            $('.card-body > a').each(function(i, elem) {
                const item = $(elem).attr('onclick').substr(14, 26).split(',')
                request({
                    method: 'GET',
                    uri: 'http://www.legislador.com.br/LegisladorWEB.ASP',
                    qs: {
                        WCI: 'ProjetoTexto',
                        ID: item[0],
                        inEspecie: item[1],
                        nrProjeto: item[2],
                        aaProjeto: item[3],
                        dsVerbete: item[4]
                    },
                    encoding: 'binary'
                }, function(err, response, html) {
                    if(response.statusCode === 200) {
                        const $ = cheerio.load(html, {normalizeWhitespace: true})

                        $('br').replaceWith('&nbsp')

                        const infos = []
                        const key = ["title", "situation", "date", "regime", "topic", "author", "program", "transaction"]

                        infos.push($('.card-header > h5').first().text())

                        $('.row > dd').each(function(i, elem) {
                            infos.push($(this).text())
                        })

                        infos.push(($('.card-body > p').first().text().trim()))

                        const arrayTransaction = []

                        $('tr > td').each(function(i, elem) {
                            arrayTransaction.push($(elem).text())
                        })
                        
                        infos.push(arrayTransaction)

                        var obj = {}
                        key.forEach(function(value, index) {
                            obj[value] = infos[index];  
                        });

                        const {title,situation,date,regime,topic,author,program,transaction} = obj;

                        Info.create({
                            title,
                            situation,
                            date,
                            regime,
                            topic,
                            author,
                            program,
                            transaction
                        })
                    }
                })
            })
        }
})
    

  