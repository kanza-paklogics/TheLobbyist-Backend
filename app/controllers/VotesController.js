

exports.changeWinningCriteria = async (req, res, next) => {
  try {
    const userId = req?.auth?.data?.userId;
    const { wid } = req.params;
    const { User, votes } = req.db.models;
    const {  changed_votes } = req.body;

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      const winningCriteria = await votes.findOne({
        where: {
          id:wid,
        },
      });

      if (winningCriteria) {
        const updateVotes = await winningCriteria.update({
          winning_criteria: changed_votes,
        });

        if (updateVotes) {
          res.status(200).send({
            success: true,
            message: "Winning criteria of votes changed",
          });
        } else {
          res.status(200).send({
            success: false,
            message: "Winning criteria of votes cannot be updated",
          });
        }
      } else {
        res.status(200).send({
          success: false,
          message: "Number of players not found",
        });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
};


exports.getWinningCriteria = async (req, res, next) => {
  const { votes } = req.db.models;
  try {
    const allVotes = await votes.findAll({});

    if (allVotes.length > 0) {
      console.log(allVotes.map((votes) => votes.toJSON()));
    } else {
      console.log(`No Votes found`);
    }

    return res.send({ status: true, votes: allVotes });
  } catch (err) {
    console.log("ee", err);
    return res.send({
      status: false,
      message: "ops something went wrong while getting Votes",
    });
  }
};