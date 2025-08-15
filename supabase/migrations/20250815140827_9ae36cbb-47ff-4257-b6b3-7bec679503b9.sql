-- Insert default colleges
INSERT INTO public.colleges (name, domain) VALUES 
('KRCE', 'krce.ac.in'),
('KRCT', 'krct.ac.in'), 
('SRM TRP', 'srmtrp.edu.in'),
('DSEC', 'dsec.ac.in')
ON CONFLICT (domain) DO NOTHING;

-- Get college IDs for department insertion
WITH college_data AS (
  SELECT id, name FROM public.colleges WHERE name IN ('KRCE', 'KRCT', 'SRM TRP', 'DSEC')
)
-- Insert default departments for each college
INSERT INTO public.departments (name, college_id)
SELECT dept.name, college_data.id
FROM college_data
CROSS JOIN (
  VALUES 
    ('Computer Science Engineering'),
    ('Information Technology'),
    ('Electrical and Electronics Engineering'),
    ('Electronics and Communication Engineering'),
    ('Artificial Intelligence and Machine Learning'),
    ('AI and Data Science'),
    ('Mechanical Engineering'),
    ('Computer Science and Business Systems'),
    ('Civil Engineering'),
    ('Biotechnology'),
    ('Chemical Engineering'),
    ('Automobile Engineering')
) AS dept(name)
ON CONFLICT DO NOTHING;