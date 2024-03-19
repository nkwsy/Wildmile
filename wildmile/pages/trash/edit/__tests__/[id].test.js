// FILEPATH: /home/lin/projects/Wildmile/wildmile/pages/trash/edit/__tests__/[id].test.js
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import UpdateTrashCountLog from '../[id]'
import { useForm } from 'react-cool-form'

jest.mock('react-cool-form') // Mock useForm hook

describe('UpdateTrashCountLog', () => {
  let mockForm

  beforeEach(() => {
    mockForm = {
      initialValues: {
        logId: '',
        items: [],
      },
      values: {
        logId: '',
        items: [],
      },
    }
    useForm.mockReturnValue(mockForm)
  })

  it('renders without crashing', () => {
    render(<UpdateTrashCountLog />)
  })

  it('initializes form with correct initial values', () => {
    render(<UpdateTrashCountLog logId="123" items={[{ id: '1', name: 'Item 1' }]} />)
    expect(mockForm.initialValues).toEqual({
      logId: '123',
      items: [{ id: '1', name: 'Item 1' }],
    })
  })

  it('submits form on button click', async () => {
    const { getByText } = render(<UpdateTrashCountLog />)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 201,
        text: () => Promise.resolve(''),
      })
    )

    fireEvent.click(getByText('Submit'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/trash/logItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockForm.values),
      })
    })
  })
})