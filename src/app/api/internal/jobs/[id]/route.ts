import { NextRequest } from "next/server";
import pool from "../../../../../lib/db/db";
import { ResultSetHeader } from "mysql2";
import { EditJobOpportunitiesSchema } from "../../../../../validations/SkillValidation";
import z from "zod";


export async function DELETE(request: NextRequest, {params}) {

  try {
    const {id} = await params;

    const jobId = parseInt(id);

    // Validate jobId
    if (isNaN(jobId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid job ID' }),
        { status: 400 }
      );
    }

    // Using mysql2 pool to delete the job record
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM job_opprtunities WHERE id = ?',
      [jobId]
    );

    // If no rows were affected, return an error message
    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: 'Job not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete job', details: error.message }),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, {params}) {

  try{

    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();

    const editForm = body.editForm;

    console.log("Receiving Body", editForm)

    const parsedBody = EditJobOpportunitiesSchema.parse(editForm);

    // Normalize incoming fields
    const { title, job_type, city, province, country, site_based, skills, experience, requirements, responsibilities, description, active } = parsedBody;

    console.log("sitebases", site_based)

    const query = `
      UPDATE job_opprtunities
      SET
        title = ?,
        job_type = ?,
        city = ?,
        province = ?,
        country = ?,
        site_based = ?,
        skills = ?,
        experience = ?,
        requirements = ?,
        responsibilities = ?,
        description = ?,
        post_status = ?
      WHERE id = ?
    `;

    const values = [
      title,
      job_type,
      city,
      province,
      country,
      site_based,
      skills,
      experience,
      requirements,
      responsibilities,
      description,
      active,
      jobId
    ];

    const [rows] = await pool.query<ResultSetHeader>(query, values);

    if(rows.affectedRows === 0) {
      return new Response(JSON.stringify({ details: "Failed to update job" }), { status: 500 });
    }

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handling Zod validation errors
      console.error('Zod Validation Errors:', error.errors);

      // You can format the errors as you like, here we join the messages for simplicity
      const errorMessages = error.errors.map(err => `${err.path.join('.')} - ${err.message}`).join(', ');

      return new Response(
        JSON.stringify({ error: 'Failed to update job', details: errorMessages }),
        { status: 400 }  // Bad Request for validation errors
      );
    } else {
      // Handle any other errors (database, etc.)
      console.error('Error updating job:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update job', details: error.message }),
        { status: 500 }
      );
    }
  }
}
