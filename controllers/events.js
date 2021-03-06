var Event = require('../models/event.js'),
    Message = require('../models/message.js'),
    mongoose = require('mongoose');

exports.create = function(req, res) {
    new Event(req.body).save(function(error, event) {
        if (error) return res.status(403).json(error);

        return res.status(201).json(event)
    })
};

exports.edit = function(req, res) {
    Event.findByIdAndUpdate(req.params.id, req.body, function (error, event) {
        if (error) return res.status(403).json(error);

        if (req.body.hasOwnProperty('$addToSet')) {
            var stringParticipants = req.body.$addToSet.participants.$each.join(',');

            event.participants.forEach(function(id) {
                stringParticipants = stringParticipants.split(id).join('')
            });

            new Message({
                user: new mongoose.Types.ObjectId(stringParticipants.split(',').join('')),
                event: new mongoose.Types.ObjectId(req.params.id),
                type: 'notify',
                details: "Se unio a la actividad"
            }).save()
        }

        return res.status(200).json(event)
    })
};

exports.list = function (req, res) {
    var sort = { start: 'desc' },
        find = { };

    if (req.query.hasOwnProperty('sort')) {
        if (req.query.sort === 'participants') {
            // sin terminar, aggr de mongodb
        }
    }

    if (req.query.hasOwnProperty('q')) {
        find['name'] = new RegExp("" + req.query.q + "", "i");
    }

    if (req.query.hasOwnProperty('users')) {
        find['participants'] = { "$in": req.query.users.split(',') };
    }

    Event.find(find).sort(sort).exec(function (error, events) {
        if (error) return res.status(403).json(error);

        return res.json(events)
    })
};

exports.search = function (req, res) {
    Event.findById(req.params.id).populate('own').exec(function (error, event) {
        if (error) return res.status(403).json(error);

        return res.status(200).json(event)
    })
};
