const Section = require("../models/Section")
const Course = require("../models/Course")

//create a new section
exports.createSection = async (req, res) => {
    try {
        // Extract datafrom the request body
        const { sectionName, courseId } = req.body;
        // Validate the Data
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            })
        }

        // Create a new section with the given name
        const newSection = await Section.create({ sectionName });

        // Add the new section to the course's content array in db
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
            .exec()
        // Return the updated course object in the response
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        })

    } catch (error) {
        // Handle errors
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
    try {
        //fetch data from body
        const { sectionName, sectionId, courseId } = req.body;
        //data validation 
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            })
        }
        //update data 
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        )

          const course = await Course.findById(courseId)
            .populate({
              path: "courseContent",
              populate: {
                path: "subSection",
              },
            }).exec()

          console.log("yeh course details hai " ,course);

        res.status(200).json({
            success: true,
            message: section,
            data: course,
        })
    } catch (error) {
        console.error("Error updating section:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// DELETE a section
exports.deleteSection = async (req, res) => {
    try{
        //get id  -assuming that we are sending ID in body
        const {sectionId} = req.body 
        //use findId and Delete 
        await Section.findByIdAndDelete(sectionId);
        //return response 
        return res.status(200).json({
            success: true,
            message: "Section deleted",
          })

    } catch (error) {
      console.error("Error deleting section:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
  