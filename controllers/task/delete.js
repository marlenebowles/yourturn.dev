const deleteTaskById = ({ Task }) => async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({
            _id,
            assignedTo: req.user._id,
        });
        if (!task) {
            return res.status(400).send({error: 'Task doesn\'t exist.'});
        }
        res.send(task);
    } catch(err) {
        res.status(400).send()
    }
};

module.exports = {
    deleteTaskById
}