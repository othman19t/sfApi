import Task from '../models/task.model.js';
export const getTasks = async (req, res) => {
  //TODO: update the code accordingly once other ports are ready
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ userId });

    console.log('tasks: ' + tasks);
    return res.status(200).send({
      message: 'successfully retrieved posts',
      success: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
